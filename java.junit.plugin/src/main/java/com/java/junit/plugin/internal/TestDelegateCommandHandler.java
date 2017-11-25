/*******************************************************************************
* Copyright (c) 2017 Microsoft Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     Microsoft Corporation - initial API and implementation
*******************************************************************************/

package com.java.junit.plugin.internal;

import java.net.URI;
import java.util.List;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;

public class TestDelegateCommandHandler implements IDelegateCommandHandler {

    public static String FETCH_TEST = "vscode.java.test.fetch";

    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
        if (FETCH_TEST.equals(commandId)) {
            return new JUnitTestFetcher().fetchTests(arguments, monitor);
        }
        throw new UnsupportedOperationException(String.format("Java test plugin doesn't support the command '%s'.", commandId));
    }

}
